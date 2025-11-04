import { Loading as GameCardLoading } from "@/components/gameCard";
import styles from "./page.module.scss";
import Carousel from "@/components/carousel";

const Loading: React.FC = () => {
  const rowsSkeleton = Array.from({ length: 5 }, (_, i) => (
    <section key={i} className={styles.genre_row}>
      <div className={styles.genre_head_sk} />
      <Carousel forceHideButtons={true} anchor={`loading-${i}`}>
        {Array.from({ length: 8 }, (_, k) => (
          <GameCardLoading key={k} direction="horizontal" />
        ))}
      </Carousel>
    </section>
  ));
  return rowsSkeleton;
};

export default Loading;
