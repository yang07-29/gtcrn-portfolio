# 公开试听音频署名与使用说明

本页只发布三组各4秒的已有教学对比：强键盘、强风扇、纯人声对照。每组含原音、GTCRN增强和参考人声。它们不是新进行的盲测，也不代表真实耳机现场录音。

## 人声：VoiceBank-DEMAND p232_003

- 署名：Cassia Valentini-Botinhao, CSTR, University of Edinburgh, 2017。
- 数据来源：https://datashare.ed.ac.uk/items/6ed35425-bf14-4d2b-93a1-0a4984952757
- DOI：10.7488/ds/2117。
- 许可：Creative Commons Attribution 4.0 International (CC BY 4.0)。
- 许可全文：https://creativecommons.org/licenses/by/4.0/
- 数据集随附许可：https://datashare.ed.ac.uk/server/api/core/bitstreams/7e7bc32f-e94a-436a-8e97-416a972c7e1a/content

## 键盘：Freesound 125548

- 作者：krissyeliot。
- 原录音页面：https://freesound.org/people/krissyeliot/sounds/125548/
- 许可：CC0 1.0，https://creativecommons.org/publicdomain/zero/1.0/。
- 归属备查：固定版本 ESC-50 署名文件列出该原录音为 krissyeliot 的 typing.wav、CC0：https://github.com/karolpiczak/ESC-50/blob/33c8ce9eb2cf0b1c2f8bcf322eb349b6be34dbb6/LICENSE 。本项目使用已保存的 DNS-Challenge 音频副本，ESC-50 此处仅用于交叉核对原录音署名。

## 风扇：Freesound 219247

- 作者：edhutschek。
- 原录音页面：https://freesound.org/people/edhutschek/sounds/219247/
- 许可：CC0 1.0，https://creativecommons.org/publicdomain/zero/1.0/。

## 修改说明

素材转为16kHz单声道后进行固定4秒裁剪；带噪案例按−5dB分量SNR合成并使用全批统一增益。增强音频由冻结GTCRN E4 seed17生成；原始下载文件保留，公开的是裁剪、混合和增强后的副本。公开播放副本为PCM16，原音、增强和参考使用同一附加播放增益1.0，没有分别进行响度归一化。指标来自冻结FLOAT输出，未用PCM16副本重新选择或改写成绩。

上述混音及增强副本保留VoiceBank的CC BY 4.0署名义务；原作者、录音者与数据集提供方不因此认可本项目或其结论。音频来源、SHA256及处理信息也保存在各案例的JSON详情中。

模型架构：GTCRN，原作者Rong Xiaobin，MIT。
上游源码：https://github.com/Xiaobin-Rong/gtcrn
本项目贡献为复现、受控实验、数据协议、部署集成与结果核验，不声称原创GTCRN网络。
