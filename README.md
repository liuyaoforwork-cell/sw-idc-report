# 西南数据中心 · 工作汇报

> 腾讯 IDC 平台部西南运营组 · 季度汇报站点

## 在线查看

**🔗 https://liuyaoforwork-cell.github.io/sw-idc-report/**

## 内容

单页滚动汇报，覆盖 6 个板块：
1. 核心指标一览（8 个 KPI）
2. 园区总览（三地园区 + 业务构成）
3. 运营质量（SLA / 事件 / 变更 / 演练）
4. 工程交付（SOP / ABC 分级 / 平台工具）
5. 降本增效（PUE / 节能项目 / 能耗构成）
6. 重点项目与规划（项目进度 / 里程碑 / 风险 / 资源）

## 技术栈

- 纯静态 HTML + CSS + 原生 JS
- 自研 SVG 图表（`assets/chart.js`）
- 数据源：6 个 JSON 文件（`data/*.json`）
- 数据协作：腾讯文档在线表格 + 本地 sync 脚本回填

## 数据更新流程

```
园区经理/板块负责人 在腾讯文档协作表格填报
        ↓
本地运行 sync.py 拉数据 → 覆盖 data/*.json
        ↓
bash sync/publish.sh → GitHub Pages 自动部署
```

内部维护工具与源代码见 WorkBuddy 工作目录。

---

_内部汇报材料 · 请勿外发_
