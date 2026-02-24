import { Loading as GameCardLoading } from "@/components/gameCard";
import styles from "./page.module.scss";
import Carousel from "@/components/carousel";
import { c } from "@/lib/utils";

const Loading: React.FC = () => {
  const rowsSkeleton = Array.from({ length: 4 }, (_, i) => (
    <section
      key={i}
      className={c(styles.games_area, i === 0 ? styles.large : null)}
    >
      <div className={styles.genre_head_sk} />
      <Carousel forceHideButtons={true} anchor={`loading-${i}`}>
        {Array.from({ length: 8 }, (_, k) => (
          <GameCardLoading key={k} direction="vertical" />
        ))}
      </Carousel>
    </section>
  ));
  return rowsSkeleton;
};

export default Loading;
