import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const apiOrigin='https://five-oh-three-as-a-service.nd4y.icu';
const css=(await readFile('web/style.css','utf8'))+'\n'+await readFile('web/motion.css','utf8');
const js=(await readFile('web/app.js','utf8'))+'\n'+await readFile('web/motion.js','utf8');
const html=(await readFile('web/index.html','utf8')).replace('<body>','<body data-api-origin="'+apiOrigin+'">').replace('href="/favicon.ico"','href="./favicon.svg"').replace('/*INLINE_CSS*/',()=>css).replace('/*INLINE_JS*/',()=>js);
await mkdir('docs',{recursive:true});await writeFile('docs/index.html',html);await writeFile('docs/.nojekyll','');await copyFile('web/favicon.svg','docs/favicon.svg');
console.log('Built GitHub Pages with external HTTP 503 API');
