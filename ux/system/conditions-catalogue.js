/* The conditions catalogue (features/conditions, skeleton 2026-10-17): one list, three kinds.
   symptom: what a worker sees · event: a thing that happened · disease: what a vet concludes.
   Built from Inspection's 119-item catalogue (60 diseases, 59 symptoms): duplicates merged, injuries and defects moved to
   events, diseases allowed under more than one system. Chinese labels are a first pass, to be checked with 饲养员 and a vet.
   Symptom groups follow where the worker looks; disease systems are Denmark's six VetStat pig disease groups. */
(function (root) {
'use strict';
const groups = [
  { id: 'whole', en: 'Whole animal', zh: '整体' },
  { id: 'breathing', en: 'Breathing', zh: '呼吸' },
  { id: 'head', en: 'Head', zh: '头部' },
  { id: 'skin', en: 'Skin', zh: '皮肤' },
  { id: 'legs', en: 'Legs and feet', zh: '腿和蹄' },
  { id: 'rear', en: 'Rear and belly', zh: '后躯和腹部' }
];
/* Pen observations (owner, 2026-10-19): what a worker sees of a pen as a whole, with no count and no pigs. They are not
   conditions: they are recorded on the pen page (How the pen looks), not on a pig or a group of pigs. */
const penObservations = [
  { id: 'pen-cough', en: 'Coughing heard', zh: '听到咳嗽' },
  { id: 'pen-scours', en: 'Scours on the floor', zh: '地面有稀便' },
  { id: 'pen-huddling', en: 'Huddling or piling', zh: '扎堆' },
  { id: 'pen-eating', en: 'Eating or drinking less', zh: '采食饮水减少' },
  { id: 'pen-biting', en: 'Tail biting going on', zh: '有咬尾' }
];
const systems = [
  { id: 'resp', en: 'Respiratory', zh: '呼吸系统' },
  { id: 'gut', en: 'Gut', zh: '消化系统' },
  { id: 'repro', en: 'Reproductive', zh: '繁殖系统' },
  { id: 'udder', en: 'Udder', zh: '乳房' },
  { id: 'msk', en: 'Joints, skin and nerves', zh: '关节、皮肤和神经' },
  { id: 'body', en: 'Whole body', zh: '全身' }
];
// [id, en, zh, group, other names, extra]
const S = (id, en, zh, group, also = [], x = {}) => ({ id, kind: 'symptom', en, zh, groups: [group], also, ...x });
const E = (id, en, zh, group, also = [], x = {}) => ({ id, kind: 'event', en, zh, groups: [group], also, ...x });
const D = (id, en, zh, sys, also = [], x = {}) => ({ id, kind: 'disease', en, zh, systems: sys, also, ...x });
const T = (id, en, zh) => ({ id, en, zh });
const items = [
  // Whole animal
  S('off-feed', 'Off feed', '不吃料', 'whole', ['poor appetite', 'anorexia', 'reduced feed intake', '采食下降'], { types: [T('eating-less', 'Eating less', '吃得少'), T('not-eating', 'Not eating', '完全不吃')] }),
  S('lethargic', 'Lethargic', '精神沉郁', 'whole', ['dull', 'depressed']),
  S('weak', 'Weak or unsteady', '站立不稳', 'whole', ['weak standing']),
  S('thin', 'Thin or poor growth', '消瘦', 'whole', ['weight loss', 'long hair coat', 'slow growth']),
  S('pale', 'Pale', '苍白', 'whole', ['pale mucous membranes']),
  S('fever', 'Fever', '发热', 'whole', ['hot to the touch', 'temperature', '高烧']),
  S('trembling', 'Trembling', '颤抖', 'whole', ['generalised tremors', 'shaking']),
  S('paddling', 'Paddling or circling', '划水或转圈', 'whole', ['circling', 'paddling while lying']),
  S('arched', 'Arched back', '弓背', 'whole', ['swayback']),
  // Breathing
  S('cough', 'Coughing', '咳嗽', 'breathing', ['long cough', 'short cough', '咳喘']),
  S('breathing-hard', 'Breathing hard', '呼吸困难', 'breathing', ['laboured breathing', 'dyspnoea', 'thumping']),
  S('sneeze', 'Sneezing', '打喷嚏', 'breathing'),
  S('nasal-discharge', 'Nasal discharge', '流鼻涕', 'breathing', ['clear or coloured nasal discharge'], { types: [T('clear', 'Clear', '清亮'), T('thick', 'Thick or yellow', '浓稠或发黄'), T('bloody', 'Bloody', '带血')] }),
  // Head
  S('eye-red', 'Red eyes', '眼睛发红', 'head', ['eye redness']),
  S('eye-discharge', 'Eye discharge', '眼分泌物', 'head'),
  S('eye-swollen', 'Swollen eyes', '眼睛肿胀', 'head'),
  S('blue-ears', 'Blue ears', '耳朵发紫', 'head', ['ear cyanosis']),
  S('ear-swelling', 'Ear swelling', '耳朵肿胀', 'head', ['ear haematoma', 'ear hematoma']),
  S('ear-discharge', 'Ear discharge', '耳朵流脓', 'head', ['ear inflammation']),
  S('ear-loss', 'Ear tissue loss', '耳朵缺损', 'head', ['partial ear tissue loss', 'ear biting']),
  S('nosebleed', 'Nosebleed or crooked snout', '流鼻血或鼻歪', 'head', ['epistaxis', 'short snout']),
  S('nose-blisters', 'Blisters on nose or mouth', '鼻或口起水泡', 'head', ['nasal blisters', 'mouth ulcers', 'vesicles']),
  S('drooling', 'Drooling', '流口水', 'head', ['excessive salivation']),
  S('teeth-grinding', 'Teeth grinding', '磨牙', 'head'),
  S('head-tilt', 'Head tilt', '歪头', 'head', ['head shaking', 'stiff neck']),
  // Skin
  S('skin-colour', 'Skin colour', '皮肤颜色异常', 'skin', ['skin discolouration', 'skin discoloration'], { types: [T('red', 'Red', '发红'), T('purple', 'Blue or purple', '发紫'), T('pale', 'Pale', '苍白')] }),
  S('rash', 'Rash', '皮疹', 'skin', ['dermatitis']),
  S('sores', 'Sores or ulcers', '溃疡', 'skin', ['skin lesions']),
  S('itching', 'Itching and hair loss', '瘙痒掉毛', 'skin', ['mange']),
  S('diamonds', 'Diamond-shaped patches', '菱形疹块', 'skin', ['round skin lesions']),
  S('bruising', 'Swelling or bruising', '水肿或淤血', 'skin', ['skin oedema', 'skin edema']),
  S('greasy', 'Greasy skin', '皮肤油腻', 'skin', ['exudative']),
  // Legs and feet
  S('lame', 'Lame', '跛行', 'legs', ['limping', '瘸'], { types: [T('joint', 'Swollen joint', '关节肿胀'), T('no-joint', 'No swelling', '无肿胀')] }),
  S('claws', 'Overgrown claws', '蹄甲过长', 'legs', ['long toenails']),
  S('hoof-wall', 'Hoof wall loss', '蹄壳脱落', 'legs', ['hoof shell loss']),
  S('hoof-blisters', 'Blisters at the hoof', '蹄部水泡', 'legs'),
  S('splayed', 'Splayed or turned feet', '八字脚', 'legs', ['pigeon toed', 'splay footed']),
  // Rear and belly
  S('diarrhoea', 'Diarrhoea', '腹泻', 'rear', ['scours', 'diarrhea', '拉稀'], { types: [T('watery', 'Watery', '水样'), T('yellow', 'Yellow', '黄色'), T('bloody', 'Bloody', '带血'), T('black', 'Black', '黑色')] }),
  S('constipation', 'Constipation', '便秘', 'rear'),
  S('vomiting', 'Vomiting', '呕吐', 'rear', ['foam']),
  S('bloated', 'Bloated belly', '腹胀', 'rear', ['abdominal pain', 'belly on floor']),
  S('urine', 'Bloody or frequent urine', '尿血或尿频', 'rear', ['frequent urination', 'white residue']),
  S('vulva', 'Swollen vulva', '阴户肿胀', 'rear', ['vulvar oedema'], { stages: ['sow'] }),
  S('vaginal-discharge', 'Vaginal discharge', '阴道分泌物', 'rear', [], { stages: ['sow'], types: [T('pus', 'White or yellow', '白色或黄色'), T('bloody', 'Bloody', '带血')] }),
  S('udder', 'Hard or swollen udder', '乳房红肿', 'rear', ['mastitis'], { stages: ['sow'] }),
  S('penile', 'Penile discharge or swelling', '包皮异常', 'rear', [], { stages: ['boar'] }),
  E('rectal-prolapse', 'Rectal prolapse', '脱肛', 'rear'),
  E('uterine-prolapse', 'Uterine prolapse', '子宫脱垂', 'rear', [], { stages: ['sow'] }),
  E('vaginal-prolapse', 'Vaginal prolapse', '阴道脱垂', 'rear', [], { stages: ['sow'] }),
  E('hernia', 'Hernia', '疝气', 'rear', ['umbilical hernia', 'abdominal hernia']),
  E('tail-bitten', 'Tail bitten', '尾巴被咬', 'rear', ['bleeding tail', 'tail-bite injury', '咬尾'], { types: [T('scratched', 'Scratched', '轻微抓伤'), T('open', 'Open wound', '开放性伤口'), T('infected', 'Infected', '感染')] }),
  // Diseases
  D('prrs', 'PRRS', '蓝耳病', ['resp', 'repro'], ['porcine reproductive and respiratory syndrome', '猪繁殖与呼吸综合征'], { notifiable: { CN: 2 }, signs: ['cough', 'breathing-hard', 'blue-ears', 'fever'] }),
  D('flu', 'Swine influenza', '猪流感', ['resp'], ['pig flu'], { signs: ['cough', 'sneeze', 'fever', 'nasal-discharge'] }),
  D('myco', 'Mycoplasma pneumonia', '猪支原体肺炎', ['resp'], ['enzootic pneumonia', '气喘病'], { signs: ['cough'] }),
  D('app', 'Actinobacillus pleuropneumonia', '猪传染性胸膜肺炎', ['resp'], ['APP'], { signs: ['cough', 'breathing-hard'] }),
  D('pasteurella', 'Pasteurellosis', '巴氏杆菌病', ['resp'], ['pasteurella']),
  D('rhinitis', 'Atrophic rhinitis', '萎缩性鼻炎', ['resp'], ['bordetella', 'inclusion body rhinitis'], { signs: ['sneeze', 'nosebleed'] }),
  D('glasser', "Glässer's disease", '副猪嗜血杆菌病', ['resp', 'msk'], ['glasser'], { signs: ['lame', 'fever'] }),
  D('ecoli', 'E. coli scours', '大肠杆菌病', ['gut'], ['colibacillosis', 'escherichia coli'], { signs: ['diarrhoea'] }),
  D('clostridial', 'Clostridial enteritis', '梭菌性肠炎', ['gut'], ['clostridium'], { signs: ['diarrhoea'] }),
  D('dysentery', 'Swine dysentery', '猪痢疾', ['gut'], [], { signs: ['diarrhoea'] }),
  D('ped', 'PED', '猪流行性腹泻', ['gut'], ['porcine epidemic diarrhoea', 'PEDV'], { notifiable: { CN: 2 }, signs: ['diarrhoea', 'vomiting'] }),
  D('tge', 'TGE', '猪传染性胃肠炎', ['gut'], ['transmissible gastroenteritis'], { signs: ['diarrhoea', 'vomiting'] }),
  D('ileitis', 'Ileitis', '回肠炎', ['gut'], ['lawsonia', 'proliferative enteropathy'], { signs: ['diarrhoea'] }),
  D('salmonella', 'Salmonellosis', '沙门氏菌病', ['gut'], ['salmonella']),
  D('rotavirus', 'Rotavirus', '轮状病毒感染', ['gut']),
  D('coccidiosis', 'Coccidiosis', '球虫病', ['gut'], [], { signs: ['diarrhoea'] }),
  D('ulcer', 'Gastric ulcer', '胃溃疡', ['gut']),
  D('parvo', 'Porcine parvovirus', '猪细小病毒病', ['repro'], ['PPV']),
  D('lepto', 'Leptospirosis', '钩端螺旋体病', ['repro']),
  D('smedi', 'SMEDI', '繁殖障碍', ['repro'], ['stillbirth', 'mummification']),
  D('brucellosis', 'Brucellosis', '布鲁氏菌病', ['repro']),
  D('pseudorabies', 'Pseudorabies', '伪狂犬病', ['repro', 'msk'], ["aujeszky's disease"], { notifiable: { CN: 2 } }),
  D('zearalenone', 'Zearalenone toxicosis', '玉米赤霉烯酮中毒', ['repro']),
  D('mma', 'MMA', '母猪无乳综合征', ['udder'], ['mastitis metritis agalactia'], { signs: ['udder'] }),
  D('strep', 'Strep suis', '猪链球菌病', ['msk'], ['streptococcus suis'], { signs: ['paddling', 'head-tilt', 'lame'] }),
  D('oedema', 'Oedema disease', '水肿病', ['msk'], ['edema disease']),
  D('teschen', 'Teschen or Talfan disease', '猪捷申病', ['msk']),
  D('salt', 'Salt poisoning', '食盐中毒', ['msk'], ['water deprivation']),
  D('mange', 'Sarcoptic mange', '疥螨病', ['msk'], [], { signs: ['itching'] }),
  D('greasy-pig', 'Greasy pig disease', '渗出性皮炎', ['msk'], ['exudative epidermitis'], { signs: ['greasy'] }),
  D('erysipelas', 'Erysipelas', '猪丹毒', ['msk'], [], { signs: ['diamonds', 'fever'] }),
  D('pox', 'Swine pox', '猪痘', ['msk']),
  D('ringworm', 'Ringworm', '皮肤真菌病', ['msk']),
  D('lice', 'Lice', '猪虱病', ['msk']),
  D('arthritis', 'Arthritis', '关节炎', ['msk'], [], { signs: ['lame'] }),
  D('foot-rot', 'Foot rot', '腐蹄病', ['msk']),
  D('osteochondrosis', 'Osteochondrosis', '骨软骨病', ['msk']),
  D('pss', 'Porcine stress syndrome', '猪应激综合征', ['msk'], ['PSS']),
  D('asf', 'African swine fever', '非洲猪瘟', ['body'], ['ASF'], { notifiable: { CN: 1 }, signs: ['fever', 'skin-colour', 'off-feed'] }),
  D('fmd', 'Foot-and-mouth disease', '口蹄疫', ['body'], ['FMD'], { notifiable: { CN: 1 }, signs: ['nose-blisters', 'hoof-blisters', 'lame'] }),
  D('csf', 'Classical swine fever', '猪瘟', ['body'], ['CSF', 'hog cholera'], { notifiable: { CN: 2 }, signs: ['fever', 'skin-colour'] }),
  D('septicaemia', 'Septicaemia', '败血症', ['body']),
  D('pcvad', 'PCV2 disease', '圆环病毒病', ['body'], ['PCVAD', 'circovirus'], { signs: ['thin'] }),
  D('epe', 'Eperythrozoonosis', '附红细胞体病', ['body'], ['haemoplasmosis']),
  D('anthrax', 'Anthrax', '炭疽', ['body']),
  D('iron', 'Iron deficiency', '缺铁性贫血', ['body'], ['anaemia'], { signs: ['pale'] }),
  D('vitamins', 'Vitamin E and selenium deficiency', '维生素E和硒缺乏', ['body'], ['mulberry heart']),
  D('rickets', 'Rickets', '佝偻病', ['body'], ['vitamin d', 'calcium deficiency']),
  D('zinc', 'Zinc deficiency', '锌缺乏', ['body'], ['parakeratosis'])
];
const byId = Object.fromEntries(items.map((x) => [x.id, x]));
root.ConditionsCatalogue = Object.freeze({ groups, systems, items, byId, penObservations });
})(globalThis);
