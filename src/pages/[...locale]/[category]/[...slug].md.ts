import type { APIRoute } from 'astro';
import { findCounterpart, getAllPosts, postParams, type Post } from '../../../i18n';
import { postMarkdown } from '../../../seo';

// /notes/foo/ is also served as /notes/foo.md, so agents can read a post without parsing the terminal chrome.
export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: postParams(post),
    props: { post, counterpart: findCounterpart(post, posts) },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { post, counterpart } = props as { post: Post; counterpart?: Post };
  return new Response(postMarkdown(post, counterpart), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
