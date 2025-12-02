import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';
import { getSiteRoot } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const navPath = footerMeta ? new URL(footerMeta, window.location).pathname : (window.wknd.demoConfig.demoBase || '/footer');
  const footerPath = footerMeta ? new URL(footerMeta).pathname : '/footer';

  let footerURL = `${getSiteRoot(3)}${navPath}.plain.html`;
  if(window.location.href.includes('author') || window.location.href.includes('publish')){
    footerURL = `${getSiteRoot(6)}${navPath}.plain.html`;
  }
  let updatedFooterUrl = footerURL.replace(/about-us\/|faqs\/|index-demo\/|magazine\/.+\/|adventures\/.+\//g, "/");

  const resp = await fetch(updatedFooterUrl.replace("//", "/"), window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  /*const resp = await fetch(`${footerPath}.plain.html`);*/

  if (resp.ok) {
    block.textContent = '';

    const html = await resp.text();
    const footer = document.createElement('div');
    footer.innerHTML = html;
    await decorateIcons(footer);

    const classes = ['brand', 'nav', 'follow', 'disc'];
    let f = footer.firstElementChild;
    while (f && classes.length) {
      f.classList.add(classes.shift());
      f = f.nextElementSibling;
    }
    block.append(footer);
  }
}
