import { Component, createSignal, JSXElement } from "solid-js";

const [darkMode, setDarkMode] = createSignal(false);
const toggleDark = () => {

  console.log("Click", darkMode());
  setDarkMode(darkMode => !darkMode);
}

export const DarkModeProvider: Component<{ children: JSXElement }> =
  ({ children }) => {
    return <div class={darkMode() ? "dark" : ""}>{children}</div>
  };

export const DarkModeToggle: Component = () => {

  return (
    <svg
      width="40"
      height="20"
      viewBox="0 0 100 100"
      class="overflow-visible cursor-pointer"
      onClick={toggleDark}
    >
      <line
        x1="0"
        y1="50"
        x2="100"
        y2="50"
        stroke-width="80"
        stroke-linecap="round"
        class={`
          stroke-teal-500 dark:stroke-slate-100
          drop-shadow-lg 
          transition duration-[1000] ease-linear`}
      />

      <circle
        cx={0}
        cy="50"
        r="50"
        class={`
          dark:translate-x-full
          fill-slate-100 stroke-slate-200 
          dark:fill-teal-500 dark:stroke-teal-400
          transition duration-[1000] ease-in 
          drop-shadow-xl`}
        stroke-width="10"
      />
    </svg>
  )

}

