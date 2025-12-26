import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
    return (
        <main className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <LoginForm />
        </main>
    );
}