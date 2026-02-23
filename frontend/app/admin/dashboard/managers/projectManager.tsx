import { ManagerConfig } from '../Manager';
import { ProjectRead, SkillRead } from '@/app/page';
import { useState, ChangeEvent, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import type { Area } from 'react-easy-crop';
import {
    ProjectFormState,
    API_URL,
    labelClass,
    inputClass,
    textareaClass,
    checkboxClass,
    cardClass,
    chipClass,
    actionButtonBase,
    actionButtonEdit,
    actionButtonDelete,
    listHeaderClass,
    listContentClass,
    listActionsClass,
} from './shared';

const Cropper = dynamic(() => import('react-easy-crop'), { ssr: false });

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_UPLOAD_QUALITY = 0.85;
const MAX_OUTPUT_WIDTH = 800;

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });
}

async function getCroppedBlob(
    imageSrc: string,
    pixelCrop: Area,
    outputWidth: number,
    mimeType: string
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const scale = pixelCrop.width > outputWidth ? outputWidth / pixelCrop.width : 1;
    const targetWidth = Math.round(pixelCrop.width * scale);
    const targetHeight = Math.round(pixelCrop.height * scale);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to initialize image editor');
    }

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
    );

    const outputType = SUPPORTED_IMAGE_TYPES.includes(mimeType) ? mimeType : 'image/jpeg';
    const quality = outputType === 'image/jpeg' ? DEFAULT_UPLOAD_QUALITY : undefined;

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Failed to prepare image'));
                    return;
                }
                resolve(blob);
            },
            outputType,
            quality
        );
    });
}

// Image upload/remove controls for a single project
function ProjectImageControls({ item, onRefresh }: { item: ProjectRead; onRefresh: () => Promise<void> }) {
    const [uploading, setUploading] = useState(false);
    const [imgError, setImgError] = useState<string | null>(null);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const modalRootRef = useRef<HTMLElement | null>(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined';

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!canUseDOM || !isMounted) return;
        const modalRoot = document.createElement('div');
        modalRoot.setAttribute('data-project-image-modal', 'true');
        document.body.appendChild(modalRoot);
        modalRootRef.current = modalRoot;
        return () => {
            document.body.removeChild(modalRoot);
            modalRootRef.current = null;
        };
    }, [canUseDOM, isMounted]);

    useEffect(() => {
        if (!canUseDOM) return;
        if (isCropOpen) {
            const previousOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = previousOverflow;
            };
        }
        return;
    }, [canUseDOM, isCropOpen]);

    async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImgError(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(file);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setPreviewUrl(URL.createObjectURL(file));
        setIsCropOpen(true);
        e.target.value = '';
    }

    function handleCropCancel() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setImgError(null);
        setIsCropOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    async function handleCropConfirm() {
        if (!selectedFile || !previewUrl || !croppedAreaPixels) return;
        setUploading(true);
        setImgError(null);
        try {
            const croppedBlob = await getCroppedBlob(
                previewUrl,
                croppedAreaPixels,
                MAX_OUTPUT_WIDTH,
                selectedFile.type
            );
            const croppedFile = new File([croppedBlob], selectedFile.name, { type: croppedBlob.type });
            const formData = new FormData();
            formData.append('file', croppedFile);
            const res = await fetch(`${API_URL}/projects/${item.id}/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error((data as { detail?: string })?.detail || 'Upload failed');
            }
            await onRefresh();
            handleCropCancel();
        } catch (err: unknown) {
            setImgError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    async function handleRemoveImage() {
        if (!confirm('Remove this project image?')) return;
        setUploading(true);
        setImgError(null);
        try {
            const res = await fetch(`${API_URL}/projects/${item.id}/image`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to remove image');
            await onRefresh();
        } catch (err: unknown) {
            setImgError(err instanceof Error ? err.message : 'Failed to remove image');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            {item.image_url && (
                <div className="mb-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.image_url!}
                        alt="Project image"
                        className="h-16 w-24 rounded-lg object-cover border border-slate-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                        className={`${actionButtonDelete} disabled:opacity-50`}
                    >
                        Remove Image
                    </button>
                </div>
            )}
            <label className={`${actionButtonBase} cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? 'Uploading...' : item.image_url ? 'Replace Image' : 'Upload Image'}
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleUpload}
                    className="sr-only"
                    disabled={uploading}
                    ref={fileInputRef}
                />
            </label>
            {imgError && <p className="mt-1 text-xs text-rose-600">{imgError}</p>}

            {isCropOpen && previewUrl && canUseDOM && modalRootRef.current &&
                createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                        <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-900">Crop project image</h4>
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    className={`${actionButtonBase} bg-slate-100 text-slate-700 hover:bg-slate-200`}
                                    disabled={uploading}
                                >
                                    Close
                                </button>
                            </div>
                            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-80">
                                <Cropper
                                    image={previewUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={0}
                                    aspect={3 / 2}
                                    minZoom={1}
                                    maxZoom={3}
                                    cropShape="rect"
                                    zoomSpeed={1}
                                    restrictPosition={true}
                                    keyboardStep={1}
                                    style={{}}
                                    classes={{}}
                                    mediaProps={{}}
                                    cropperProps={{}}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={(_, croppedAreaPixelsValue) =>
                                        setCroppedAreaPixels(croppedAreaPixelsValue)
                                    }
                                />
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                                <label className="text-xs font-semibold text-slate-700" htmlFor={`zoom-${item.id}`}>
                                    Zoom
                                </label>
                                <input
                                    id={`zoom-${item.id}`}
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={(event) => setZoom(Number(event.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </div>
                            {imgError && <p className="mt-2 text-xs text-rose-600">{imgError}</p>}
                            <div className="mt-4 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    className={`${actionButtonBase} bg-slate-100 text-slate-700 hover:bg-slate-200`}
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCropConfirm}
                                    className={`${actionButtonBase} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60`}
                                    disabled={uploading || !croppedAreaPixels}
                                >
                                    {uploading ? 'Uploading...' : 'Crop & Upload'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    modalRootRef.current
                )}
        </div>
    );
}

export function createProjectConfig(skills: SkillRead[]): ManagerConfig<ProjectRead, ProjectFormState> {
    return {
        entityName: 'Project',
        entityNamePlural: 'Projects',
        apiEndpoint: 'projects',
        getInitialFormState: () => ({
            name: '',
            description: '',
            isCompleted: false,
            selectedSkills: [],
            content: null,
        }),
        resetFormData: ({ setFormState }) => {
            setFormState({
                name: '',
                description: '',
                isCompleted: false,
                selectedSkills: [],
                content: null,
            });
        },
        setFormData: (item, { setFormState }) => {
            setFormState({
                name: item.name,
                description: item.description,
                isCompleted: item.is_completed,
                content: item.content,
                selectedSkills: item.skills.map((skill) => skill.id),
            });
        },
        getFormData: (formState) => ({
            name: formState.name,
            description: formState.description,
            is_completed: formState.isCompleted,
            content: formState.content,
            skill_ids: formState.selectedSkills,
        }),
        renderForm: ({ formState, setFormState }) => {
            const toggleSkill = (skill: SkillRead) => {
                const newSkills = formState.selectedSkills.includes(skill.id)
                    ? formState.selectedSkills.filter((id: number) => id !== skill.id)
                    : [...formState.selectedSkills, skill.id];
                setFormState({ ...formState, selectedSkills: newSkills });
            };

            return (
                <>
                    <div className="mb-3">
                        <label className={labelClass}>Name</label>
                        <input
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={formState.description}
                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                            className={textareaClass}
                            rows={3}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={formState.isCompleted}
                                onChange={(e) =>
                                    setFormState({ ...formState, isCompleted: e.target.checked })
                                }
                                className={checkboxClass}
                            />
                            <span className="text-sm font-semibold">Completed</span>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Content</label>
                        <textarea
                            value={formState.content || ''}
                            onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                            className={textareaClass}
                            rows={4}
                        />
                    </div>

                    <div className="mb-3">
                        <label className={labelClass}>Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <label key={skill.id} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.selectedSkills.includes(skill.id)}
                                        onChange={() => toggleSkill(skill)}
                                        className={checkboxClass}
                                    />
                                    {skill.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            );
        },
        renderListItem: ({ item, onEdit, onDelete, onRefresh }) => (
        <div className={cardClass}>
            <div className={`${listHeaderClass} mb-2`}>
                <div className={listContentClass}>
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{item.name}</h3>
                    <p className="text-sm text-slate-600 break-words">{item.description}</p>
                </div>
                <div className={listActionsClass}>
                    <button
                        onClick={() => onEdit(item)}
                        className={actionButtonEdit}
                    >
                        Edit
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className={actionButtonDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.is_completed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                        {item.is_completed ? 'Completed' : 'Ongoing'}
                    </span>
                    {item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {item.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className={chipClass}
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <ProjectImageControls item={item} onRefresh={onRefresh} />
            </div>
        ),
    };
}
