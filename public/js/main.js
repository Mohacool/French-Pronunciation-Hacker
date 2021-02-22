// // Register Service Worker
// if ('serviceWorker' in navigator){
//     window.addEventListener('load', ()=>{
//         navigator.serviceWorker
//             .register('../assets/js/sw_cached_pages.js')
//             .then(reg => console.log('Service worker Registered'))
//             .catch(err => console.log(`Service Worker Error ${err}`));
//     })
// }