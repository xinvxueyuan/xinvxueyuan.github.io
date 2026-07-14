# deployments-cicd

触发：后续 Preview、部署诊断或回滚设计。负责 Vercel CI/CD 约定；不允许未经用户验收 Promote。输入为部署目标，输出 Preview/诊断方案。可能改变外部部署状态，B 级；当前只学习，禁止调用写操作。
