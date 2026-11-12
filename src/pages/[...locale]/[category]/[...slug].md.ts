import type { APIRoute } from 'astro';
import { findTranslations, getAllPosts, postParams, type Post } from '../../../i18n';
import { postMarkdown } from '../../../seo';

// /notes/foo/ is also served as /notes/foo.md, so agents can read a post without parsing the terminal chrome.
export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: postParams(post),
    props: { post, translations: findTranslations(post, posts) },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { post, translations } = props as { post: Post; translations: Post[] };
  return new Response(postMarkdown(post, translations), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
