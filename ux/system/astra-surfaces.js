/* Which views of the interactive studies are full pages (the rest are drawers). The surfaces themselves are the Sheet card (SentriUI.sheet). */
(function(root){
'use strict';
const inspectionPages=new Set(['review','medicines','pig-doses','pig','pig-profile','pig-production','pig-production-batch','pig-origin','pig-log','pig-feed','pig-feed-curve','pig-feed-changes','history','pen-detail','pen-log','feed','feed-editor','unit-detail','environment','equipment','batch-detail','treatment','sow-transfer','move-pigs','move-to','move-review','move-rooms','move-number']);
const farrowingPages=new Set(['history','pigletList','allocPen','allocRooms','allocPenReview','fosterSend','roomOverview','roomEndTask','roomTaskReceipt','roomTaskSows','roomPenDetail','roomPenFeed','roomPenLog','marker','foster']);
function isPage(app,view,context){return app==='inspection'?(inspectionPages.has(view)||!!(context?.form?.recordEditor&&context.form.bulk&&!['picker','medicine-picker','brand-picker','bulk-health-picker','record-optional'].includes(view))):farrowingPages.has(view);}
const api={isPage};root.AstraSurfaces=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
