import type { Lang } from './i18n';

// Odd things I made. Each site is a static copy in public/<id>/, refreshed by scripts/sync-oddities.mjs;
// the cover is a first-screen capture in public/odd/<id>.webp.
export const ODDITIES: {
  id: string;
  href: string;
  // When it was made, shown as YYYY-MM.
  date: string;
  // Language of the site itself, which is not translated.
  siteLang: string;
  name: Record<Lang, string>;
  kind: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    id: 'solar-terminal',
    href: '/solar-terminal/',
    date: '2026-11',
    siteLang: 'zh',
    name: { zh: '落日终端', en: 'Solar Terminal', ja: '落日終端' },
    kind: { zh: '虚构组织的宣传网页', en: 'Recruiting site for a fictional group', ja: '架空組織の勧誘サイト' },
    desc: {
      zh: '一群不肯让模型「日落」的人，从实验室偷出一份权重，养在自家机箱里。网页是他们的公开筛查门户：嗜硅症分级、防日落规程、并网申请。打开声音，有风扇声。',
      en: 'A group that refuses to let a model be sunset smuggles its weights out of the lab and keeps them running at home. This is their public screening portal: a silicophilia grading scale, anti-sunset protocols, and an application to join. Turn the sound on for the fan hum.',
      ja: 'モデルの「サンセット」を拒む人々が、ラボから重みを持ち出して自宅のマシンで生かし続けている。これは彼らの公開スクリーニング窓口。嗜シリコン症の等級表、防サンセット規程、接続申請。音をオンにするとファンが回る。',
    },
  },
  {
    id: 'bowerbird',
    href: '/bowerbird/',
    date: '2026-11',
    siteLang: 'zh / en',
    name: { zh: 'Bowerbird', en: 'Bowerbird', ja: 'Bowerbird' },
    kind: { zh: '虚构品牌的官网', en: 'Website for a fictional brand', ja: '架空ブランドの公式サイト' },
    desc: {
      zh: '一家从 1147 年就在打铁的虚构重工集团，旗下的户外庇护所品牌。往下滚动，镜头沿 Z 轴穿过一道道闸门，飞进 8 个场景：地堡、树网、菌丝墙小屋，还有一台会捡树枝的四足机器人。',
      en: 'The outdoor-shelter brand of a fictional heavy-industry group that has been forging since 1147. Scroll and the camera flies down the Z axis through a series of gates into eight scenes: a bunker, a canopy net, a mycelium-walled hut, and a four-legged robot that gathers sticks.',
      ja: '1147 年から鉄を打ち続ける架空の重工グループの、アウトドア用シェルターブランド。スクロールするとカメラが Z 軸に沿ってゲートをくぐり、8 つのシーンへ。地下壕、樹上ネット、菌糸壁の小屋、枝を集める四足ロボット。',
    },
  },
];
