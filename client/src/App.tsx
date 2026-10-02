import { Layout } from "./components/Layout.tsx";
import { useRoute } from "./lib/router.ts";
import { useStore } from "./lib/store.ts";
import { Foods } from "./screens/Foods.tsx";
import { ArticleDetail, Guide } from "./screens/Guide.tsx";
import { Onboarding } from "./screens/Onboarding.tsx";
import { ProfileScreen } from "./screens/Profile.tsx";
import { RecipeDetail } from "./screens/RecipeDetail.tsx";
import { Recipes } from "./screens/Recipes.tsx";
import { Report } from "./screens/Report.tsx";
import { Today } from "./screens/Today.tsx";
import { Tracker } from "./screens/Tracker.tsx";
import { Weekly } from "./screens/Weekly.tsx";

export function App() {
  const hasProfile = useStore((s) => Boolean(s.profile));
  const route = useRoute();

  if (!hasProfile) return <Onboarding />;

  const [first, second] = route.segments;
  let screen;
  switch (first) {
    case undefined:
      screen = <Today />;
      break;
    case "hafta":
      screen = <Weekly />;
      break;
    case "tarifler":
      screen = <Recipes />;
      break;
    case "tarif":
      screen = second ? <RecipeDetail key={second} id={second} /> : <Recipes />;
      break;
    case "besinler":
      screen = <Foods />;
      break;
    case "gunluk":
      screen = <Tracker />;
      break;
    case "rapor":
      screen = <Report />;
      break;
    case "rehber":
      screen = second ? <ArticleDetail key={second} id={second} /> : <Guide tab={route.query.get("tab") ?? undefined} />;
      break;
    case "profil":
      screen = <ProfileScreen />;
      break;
    default:
      screen = <Today />;
  }

  return <Layout path={route.path}>{screen}</Layout>;
}
