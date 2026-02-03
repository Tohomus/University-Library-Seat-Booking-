## About our App

The CUSAT Library Seat Booking System is a modern web application designed to help university students easily reserve study seats in the library lounge. Built using React (Vite) and Tailwind CSS, the app provides a clean, responsive, and user-friendly interface. Firebase Authentication is used for secure login and registration, while Firestore manages real-time seat availability, booking history, and user profiles. The system prevents multiple active bookings per user and allows users to view and manage their bookings through a profile page. The app is deployed on Vercel and supports PWA features, enabling users to install it on their mobile devices for an app-like experience.


## Deployment & Routing Note

This application is deployed as a Single Page Application (SPA) using React Router.

To prevent 404 errors on page refresh (e.g. `/login`, `/booking`, `/profile`),
a `vercel.json` rewrite rule is used so that all routes are correctly handled
by `index.html` and React Router.

This ensures smooth navigation and refresh behavior across desktop and mobile devices.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
