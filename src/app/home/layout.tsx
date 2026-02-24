import { ErrorBoundary } from "react-error-boundary";
import styles from "./page.module.scss";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className={styles.main_section}>
      <ErrorBoundary fallback={<p>shit!</p>}>{children}</ErrorBoundary>
    </main>
  );
};

export default BaseLayout;
