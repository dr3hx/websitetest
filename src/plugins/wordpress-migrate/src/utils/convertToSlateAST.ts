import { htmlToSlateAST } from '@graphcms/html-to-slate-ast';

export async function convertToSlateAST(html: string) {
  try {
    const ast = await htmlToSlateAST(html);
    return ast;
  } catch (error) {
    console.error('Error converting HTML to Slate AST:', error);
    return [{ type: 'paragraph', children: [{ text: html }] }];
  }
}
