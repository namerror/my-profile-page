# Frontend Programming Guide

## Main Contents Index

- Home page - `frontend/app/page.tsx`
    
    - Entry point, renders the main title, project snapshot, and current learning

- Admin Dashboard - `frontend/app/admin/dashboard/page.tsx`
    
    - Admin dashboard page, which is used to manage items, easy crud operations in DB.
    - See `frontend/app/admin/dashboard/README.md` for more details.

- Project page - `frontend/app/projects/[id]/page.tsx`
    
    - Renders the project details page, shown when clicking on a project card or a project bar.

- Activities page - `frontend/app/activities/page.tsx`
    
    - Renders all activities in the database.

- About page - `frontend/app/about/page.tsx`

- Contact page - `frontend/app/contact/page.tsx`

- Components - `frontend/app/components/`
    
    - Navbar used across the whole app - `frontend/app/components/Navbar.tsx`
    - Scrolling effect across the whole app - `frontend/app/components/MomentumScroll.tsx`
    - Item card used to display project summaries in list-style layouts - `frontend/app/components/ProjectBar.tsx`
    - Item card used to display each Project in home page - `frontend/app/components/ProjectCard.tsx`
    - A carousel used to display display ProjectCards in home page - `frontend/app/components/ProjectCarousel.tsx`
    - A component used to render changing animation of role and skills in home page - `frontend/app/components/RoleRotator.tsx`
    - Scrolling effect/animation of the project snapshot section in home page - `frontend/app/components/ScrollEffect.tsx`
    - Tilting animation based on mouse movement used in home page title section - `frontend/app/components/TiltSection.tsx`
