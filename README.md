# React Calculator App (Vite + React)
This project is a responsive calculator application built with [React](https://react.dev/) and [Vite](https://vitejs.dev/). It features keyboard support, percentage calculation, and a modern UI with both mouse and keyboard input.
## Features
- **Basic arithmetic:** Addition, subtraction, multiplication, division
- **Percentage (%)**: Converts the last number to a percentage
- **Keyboard support:** Use numbers, operators, Enter, Backspace, and Escape
- **Responsive design:** Works on desktop and mobile
- **Clear (AC) and Delete (DEL) buttons**
- **Error handling:** Displays "Error" for invalid expressions
## Folder Structure
```
my-app/
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── vite.config.js
├── public/
│   └── vite.svg
└── src/
    ├── App.css
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    └── assets/
        └── react.svg
```
- **src/App.jsx**: Main calculator logic and UI ([src/App.jsx](src/App.jsx))
- **src/main.jsx**: Entry point, renders the App ([src/main.jsx](src/main.jsx))
- **src/index.css**: Global styles ([src/index.css](src/index.css))
- **src/App.css**: Calculator-specific styles ([src/App.css](src/App.css))
- **public/**: Static assets

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation
1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd my-app
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
### Running the App
Start the development server:
```sh
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.
### Building for Production
To build the app for production:
```sh
npm run build
```
Preview the production build locally:
```sh
npm run preview
```
## Usage
- Click the calculator buttons or use your keyboard:
  - **Numbers:** 0-9
  - **Operators:** +, -, *, /
  - **Equals:** Enter or =
  - **Clear:** AC or Escape
  - **Delete:** DEL or Backspace
  - **Percentage:** %
  - **Decimal:** .
- The display shows your current input and the result.
## Customization
- Edit [`src/App.jsx`](src/App.jsx) to change calculator logic or UI.
- Update styles in [`src/App.css`](src/App.css) and [`src/index.css`](src/index.css).
## Dependencies
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/) (for linting)
- [Tailwind CSS](https://tailwindcss.com/) (optional, included in devDependencies)
**Made with [Vite](https://vitejs.dev/) and [React](https://react.dev/).**
