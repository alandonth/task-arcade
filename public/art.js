import {ANIMALS,wardrobeFor} from './catalog.js';
// Original inline SVG artwork. No external fonts, image requests, or icon service.
const paths={
 star:'<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9Z"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
 clock:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 5V2m6 4 2-2M12 8v5l3 2"/>',
 map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
 gift:'<path d="M3 9h18v4H3zm2 4v8h14v-8M12 9v12"/><path d="M12 9C2 9 6 0 10 4l2 5Zm0 0c10 0 6-9 2-5l-2 5Z"/>',
 key:'<circle cx="8" cy="9" r="5"/><path d="m12 13 8 8m-4-4 3-3m-6 0 3-3"/>',
 arcade:'<path d="M7 3h10l2 10v8H5v-8Z"/><path d="M8 6h8v5H8zm1 9v3m-2-1h4m4-1h2"/>',
 book:'<path d="M12 5C8 2 4 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-2-1-6-2-10 1Zm0 0v15"/>',
 broom:'<path d="m17 2-7 11m-3-1 7 4-5 6-7-4Zm-3 3 7 4"/>',
 rocket:'<path d="M9 15C8 7 15 2 21 3c1 6-4 13-12 12Zm0 0-5-1 1-4 5-2m4 6 1 5-4 1-1-5M6 18l-3 3"/><circle cx="16" cy="8" r="2"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
 moon:'<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/><path d="M18 3v4m-2-2h4"/>',
 sound:'<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 flag:'<path d="M5 22V3c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
 cloud:'<path d="M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11Z"/>',
 volcano:'<path d="m2 21 7-13h6l7 13Zm7-13 3 5 3-5M9 4 7 2m5 3V1m3 3 2-2"/>',
 monster:'<path d="M5 8 3 3l6 3h6l6-3-2 5v9c0 4-14 4-14 0Z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 17h6"/>',
 tools:'<path d="m4 3 4 4-2 2-4-4v5l5 3 11 9 3-3-9-11-3-5Z"/>',
 shirt:'<path d="m8 3 4 3 4-3 6 5-4 4-2-2v11H8V10l-2 2-4-4Z"/>'
};
export function icon(name,cls=''){return `<svg class="svg-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.star}</svg>`;}
const emoji={'🎪':'arcade','⏱':'clock','🗺️':'map','🎁':'gift','🔑':'key','⚡':'bolt','✨':'star','⭐':'star','👾':'monster','🔒':'lock','💤':'moon','☁️':'cloud','📚':'book','🧹':'broom','🚀':'rocket','🌋':'volcano','🔊':'sound','🏁':'flag','🛠️':'tools'};
export function vectorize(html){for(const [key,name] of Object.entries(emoji))html=html.replaceAll(key,icon(name));return html;}
export function character(w,cls=''){w=wardrobeFor({wardrobe:w});const a=ANIMALS.find(a=>a.id===w.animal),c=a.color;
 const ears={frog:`<circle cx="66" cy="61" r="24" fill="${c}"/><circle cx="134" cy="61" r="24" fill="${c}"/>`,fox:`<path d="M48 79 43 24l47 39M112 63l45-39-4 57" fill="${c}"/><path d="m55 58-3-18 20 17m57 0 20-17-2 18" fill="#ffd8b1"/>`,cat:`<path d="m49 79-4-48 44 28m23 0 43-28-4 48" fill="${c}"/><path d="m57 56-1-10 17 11m56 0 15-11-1 11" fill="#ffb5cb"/>`,bear:`<circle cx="54" cy="59" r="23" fill="${c}"/><circle cx="146" cy="59" r="23" fill="${c}"/><circle cx="54" cy="59" r="10" fill="#efc6a4"/><circle cx="146" cy="59" r="10" fill="#efc6a4"/>`}[w.animal];
 const shirt=w.equipped.shirt,shirtColor={'shirt-basic':'#ffcf3f','shirt-space':'#7054ba','shirt-stripe':'#6dd4ed','shirt-lava':'#ff765a'}[shirt];
 const hats={cap:'<path d="M56 59q5-39 44-39t44 39Z" fill="#55b9d4"/><path d="M54 59h100q10 0 10 9H58Z" fill="#3187b5"/>',crown:'<path d="m55 59-5-36 28 15 22-25 22 25 28-15-5 36Z" fill="#ffcf3f"/><circle cx="100" cy="44" r="5" fill="#ff698b"/>',wizard:'<path d="m61 58 39-51 40 51Z" fill="#7753b5"/><path d="M49 58h102v10H49Z" fill="#9e7ce6"/><path d="m99 26 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#ffcf3f"/>'};
 const accessories={glasses:'<circle cx="73" cy="88" r="18" fill="none" stroke-width="5"/><circle cx="127" cy="88" r="18" fill="none" stroke-width="5"/><path d="M91 86q9-6 18 0" fill="none" stroke-width="5"/>',bowtie:'<path d="m100 142-21-12v25l21-11 21 11v-25Z" fill="#ff698b"/><circle cx="100" cy="143" r="6" fill="#c65889"/>',satchel:'<path d="m70 127 62 57" fill="none" stroke="#86533d" stroke-width="9"/><rect x="112" y="157" width="38" height="33" rx="7" fill="#bd8553"/><path d="M114 165h34m-21 0v10h10v-10" fill="none"/>'};
 return `<svg class="character ${cls}" viewBox="0 0 200 210" role="img" aria-label="${a.name} character"><g stroke="#312459" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="100" cy="196" rx="55" ry="8" fill="#31245918" stroke="none"/><ellipse cx="72" cy="185" rx="18" ry="12" fill="${c}"/><ellipse cx="128" cy="185" rx="18" ry="12" fill="${c}"/><path d="M64 127q36-15 72 0l14 48-15 5-8-22v31H73v-31l-8 22-15-5Z" fill="${shirtColor}"/>${shirt==='shirt-stripe'?'<path d="M75 148h50m-50 12h50m-50 12h50" stroke="#ff698b" stroke-width="8"/>':''}${shirt==='shirt-space'?'<path d="m100 143 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" fill="#ffcf3f"/>':''}${shirt==='shirt-lava'?'<path d="m87 174 4-18 8 7 5-20 10 31Z" fill="#ffcf3f"/>':''}${ears}<ellipse cx="100" cy="88" rx="58" ry="45" fill="${c}"/>${w.animal==='fox'?'<path d="M47 93q24 1 53 28 30-27 53-28-3 40-53 40T47 93Z" fill="#fff0d6"/>':w.animal==='bear'?'<ellipse cx="100" cy="106" rx="28" ry="20" fill="#efc6a4"/>':''}<ellipse cx="73" cy="86" rx="6" ry="9" fill="#312459"/><ellipse cx="127" cy="86" rx="6" ry="9" fill="#312459"/><circle cx="71" cy="82" r="2" fill="white" stroke="none"/><circle cx="125" cy="82" r="2" fill="white" stroke="none"/><path d="M90 107q10 12 20 0" fill="none"/>${w.animal!=='frog'?'<path d="m94 98 6 5 6-5Z" fill="#312459"/>':''}<ellipse cx="60" cy="103" rx="9" ry="5" fill="#ff93aa" stroke="none"/><ellipse cx="140" cy="103" rx="9" ry="5" fill="#ff93aa" stroke="none"/>${hats[w.equipped.hat]||''}${accessories[w.equipped.accessory]||''}</g></svg>`;
}
