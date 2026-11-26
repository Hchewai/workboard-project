import BreadCrumbNavigation from "./BreadCrumbs";

export default function MainContent({ children }) {
  return (
    // Semantic main element identifies the primary content of the page.
    <main className="main-content">
      {/* Container used to control the width, spacing and layout of page content. */}
      <div className="content-container">
        {/* Render whatever page content is passed into MainContent. */}
        <BreadCrumbNavigation />
        {children}
      </div>
    </main>
  );
}
