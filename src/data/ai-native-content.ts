import type { Lang } from '../i18n';
import type { Content } from './ai-native';
import zh from './ai-native/zh.json';
import en from './ai-native/en.json';
import ja from './ai-native/ja.json';

// zh is the hand-written original, polished by Gemini; en and ja are translated from it.
export const CONTENT: Record<Lang, Content> = { zh, en, ja };
