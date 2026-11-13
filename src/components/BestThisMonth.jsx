import Carousel from './Carousel';
import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import FestivalCard from './FestivalCard';
import useLang from '../lib/useLang';
import { bestIn } from '../lib/catalogue';
import { currentMonth, monthName } from '../lib/months';

/** Home carousel: what's at its best this month. */
export default function BestThisMonth({ month = currentMonth() }) {
  const { t, lang } = useLang();
  const best = bestIn(month);
  if (best.places.length + best.foods.length + best.festivals.length === 0) return null;
  return (
    <Carousel
      title={t('season.homeTitle', { month: monthName(month, lang) })}
      subtitle={
        <>
          {t('season.homeSub')} · <a href="#/seasons">{t('season.allMonths')}</a>
        </>
      }
    >
      {best.places.map((p) => (
        <li key={p.id}>
          <PlaceCard place={p} showDistrict showSeason />
        </li>
      ))}
      {best.foods.map((f) => (
        <li key={f.id}>
          <FoodCard food={f} />
        </li>
      ))}
      {best.festivals.map((f) => (
        <li key={f.id}>
          <FestivalCard festival={f} month={month} />
        </li>
      ))}
    </Carousel>
  );
}
