import { useAtom } from "jotai";
import { dualThemeAtom } from "../theme.atom";

export const useTheme = () => {
    return useAtom(dualThemeAtom);
};
