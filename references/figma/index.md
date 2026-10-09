# Old UI in Figma

The seven old-UI files, from Figma's page structure (`outline.txt`). Screens are Figma frames, counted per file. A flow is a sub-group in a section; the node id opens its section. Link: `https://www.figma.com/design/<key>?node-id=<node id with - for :>`.

| File | Key | Screens | Flows |
|---|---|---|---|
| 首页 Home | `UuyZbUklgF674X57hm3PHF` | 17 | 1 |
| 生产任务 Production tasks | `psrxDa9LRWLdTL9XMZmWdc` | 172 | 16 |
| 巡检 Inspection | `4GZGPBauEOWQQjnRrzoUgF` | 149 | 23 |
| 猪只列表 Pig list | `ZnHLToEqmWREEgMXsu8ZvZ` | 44 | 11 |
| 健康与治疗 Health & treatment | `pvx1wum54VYOsIjep7haoZ` | 28 | 9 |
| 数据同步 Data sync | `LhQhJho192tNKCFvf5Drnf` | 17 | 4 |
| 采样与检测 Sampling & testing | `PqMXbJLyoJ9lFGjmqBv5Cs` | 17 | 4 |

## 首页 Home

`UuyZbUklgF674X57hm3PHF` · 17 screens

| Flow | Screens | Node | Atlas feature |
|---|---|---|---|
| 工作台 | 5 | `6003:11580` | workbench |

## 生产任务 Production tasks

`psrxDa9LRWLdTL9XMZmWdc` · 172 screens

| Flow | Screens | Node | Atlas feature |
|---|---|---|---|
| 查情 · 任务已结束 | 17 | `7561:10830` | heat-check |
| 查情 · ⬇️ 转移单头猪（2026.1.23） | 4 | `7561:10830` | heat-check |
| 查情 · ⬆️ 结束任务后，返回首页，并定位至该舍的Tab | 1 | `7561:10830` | heat-check |
| 查情 · 任务进行中 | 13 | `7561:10830` | heat-check |
| 配种 · 任务已结束 | 7 | `7845:6780` | breeding |
| 配种 · ⬇️ 6 种搜索结果（2026.1.20） | 11 | `7845:6780` | breeding |
| 配种 · 任务进行中 | 8 | `7845:6780` | breeding |
| 分娩 · 任务已结束 | 11 | `7952:7750` | farrowing |
| 分娩 · 任务进行中 | 7 | `7952:7750` | farrowing |
| 仔猪处理 · 任务已结束 | 15 | `8003:11059` | piglet-processing |
| 仔猪处理 · 任务进行中 | 7 | `8003:11059` | piglet-processing |
| 仔猪处理 · text | 6 | `8003:11059` | piglet-processing |
| 母猪产后检查 · 任务已结束 | 7 | `8006:14820` | post-farrowing |
| 母猪产后检查 · 任务进行中 | 5 | `8006:14820` | post-farrowing |
| 断奶检查 · 任务已结束 | 17 | `8023:17019` | weaning |
| 断奶检查 · 任务进行中 | 10 | `8023:17019` | weaning |

## 巡检 Inspection

`4GZGPBauEOWQQjnRrzoUgF` · 149 screens

| Flow | Screens | Node | Atlas feature |
|---|---|---|---|
| 生产-标记留种 | 8 | `60:408` | keep-breeding |
| 生产-移除留种 | 5 | `60:408` | keep-breeding |
| 首页 | 2 | `60:408` | inspection |
| 巡检详情页 | 5 | `60:408` | inspection |
| text | 36 | `60:408` | inspection (equipment, count, feed and pen sheets) |
| 备注 | 3 | `60:408` | inspection |
| 生产-发情 | 8 | `60:408` | heat |
| 生产-流产 | 6 | `60:408` | abortion |
| 生产-意外妊娠 | 10 | `60:408` | unexpected-pregnancy |
| 健康-移除疾病/症状 | 6 | `60:408` | disease |
| 生产-分娩 | 8 | `60:408` | farrowing-record |
| 健康-分诊等级 | 5 | `60:408` | triage |
| 健康-上报死亡（逻辑同生产任务） | 10 | `60:408` | report-death |
| 生产-断奶 | 10 | `60:408` | wean |
| 记录-上报失踪 | 1 | `60:408` | missing |
| 健康-添加疾病/症状 | 4 | `60:408` | disease |
| 记录-背膘 | 3 | `60:408` | backfat and weight |
| 记录-体温 | 1 | `60:408` | temperature |
| 记录-转移 | 2 | `60:408` | move |
| 健康-治疗 | 4 | `60:408` | treat |
| 记录-寄养 | 6 | `60:408` | fostering |
| 空怀/后备，已发情，已配种，已妊娠，成长期 | 2 | `60:408` | heat |
| No ID Pigs | 4 | `60:408` | keep-breeding |

## 猪只列表 Pig list

`ZnHLToEqmWREEgMXsu8ZvZ` · 44 screens

| Flow | Screens | Node | Atlas feature |
|---|---|---|---|
| 猪只列表（CN） · 猪只详情 | 4 | `6003:11580` | pig-profile |
| 猪只列表（CN） · 猪只列表 | 4 | `6003:11580` | pig-list |
| 猪只列表（CN） · 健康管理 | 6 | `6003:11580` | pig-profile / health-record |
| 猪只列表（CN） · 全部事件 | 3 | `6003:11580` | pig-profile |
| 猪只列表（CN） · 编辑猪只信息 | 3 | `6003:11580` | pig-profile |
| 猪只列表（CN） · 添加疾病/症状后，是否提示修改分针等级 | 1 | `6003:11580` | pig-profile / health-record |
| 猪只列表（EN） · 猪只详情 | 4 | `11590:489` | pig-profile |
| 猪只列表（EN） · 猪只列表 | 4 | `11590:489` | pig-list |
| 猪只列表（EN） · 健康管理 | 6 | `11590:489` | pig-profile / health-record |
| 猪只列表（EN） · 全部事件 | 3 | `11590:489` | pig-profile |
| 猪只列表（EN） · 编辑猪只信息 | 3 | `11590:489` | pig-profile |

## 健康与治疗 Health & treatment

`pvx1wum54VYOsIjep7haoZ` · 28 screens

| Flow | Screens | Node | Atlas feature |
|---|---|---|---|
| 首页入口 | 3 | `6003:11580` | prescriptions |
| ⬇终止处方 | 3 | `6003:11580` | prescriptions |
| ⬇移除猪只 | 2 | `6003:11580` | prescriptions |
| 健康与治疗 | 3 | `6003:11580` | prescriptions |
| ⬇移出处方 | 2 | `6003:11580` | prescriptions |
| ⬇跳过剂次 | 2 | `6003:11580` | prescriptions |
| ⬇治疗 | 6 | `6003:11580` | prescriptions |
| ⬇终止治疗 | 3 | `6003:11580` | prescriptions |
| ⬇添加猪只 | 2 | `6003:11580` | prescriptions |

## 数据同步 Data sync

`LhQhJho192tNKCFvf5Drnf` · 17 screens

| Flow | Screens | Node | Atlas feature |
|---|---|---|---|
| 公告栏位置示意 | 2 | `10541:8073` | data-sync |
| 数据同步-列表 | 2 | `10541:8073` | data-sync |
| 数据同步-详情 | 7 | `10541:8073` | data-sync |
| title | 6 | `10541:8073` | data-sync |

## 采样与检测 Sampling & testing

`PqMXbJLyoJ9lFGjmqBv5Cs` · 17 screens

| Flow | Screens | Node | Atlas feature |
|---|---|---|---|
| 采样 V2.0 CN · 待采样 | 5 | `6032:6415` | sampling |
| 采样 V2.0 CN · 已采样 | 6 | `6032:6415` | sampling |
| 采样 V2.0 EN · 待采样 | 3 | `6032:8550` | sampling |
| 采样 V2.0 EN · 已采样 | 3 | `6032:8550` | sampling |
