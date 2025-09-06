<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <ul>
            <li><a href="#">公司简介</a></li>
            <li><a href="#">企业文化</a></li>
            <li><a href="#">发展历程</a></li>
            <li><a href="#">联系我们</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li><router-link to="/news">资讯中心</router-link></li>
            <li><router-link to="/knowledge">知识平台</router-link></li>
            <li><router-link to="/forum">企业论坛</router-link></li>
            <li><router-link to="/market">跳蚤市场</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>帮助支持</h3>
          <ul>
            <li><a href="#">使用帮助</a></li>
            <li><a href="#">常见问题</a></li>
            <li><a href="#">意见反馈</a></li>
            <li><a href="#">技术支持</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>联系方式</h3>
          <div class="contact-info">
            <p>
              <a-icon type="phone" />
              客服热线：400-888-8888
            </p>
            <p>
              <a-icon type="message" />
              邮箱：support@company.com
            </p>
            <p>
              <a-icon type="location" />
              地址：北京市朝阳区xxx街道xxx号
            </p>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; 2024 企业门户系统. 保留所有权利.</p>
        </div>
        <div class="links">
          <a href="#">隐私政策</a>
          <a href="#">使用条款</a>
          <a href="#">网站地图</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 图标已通过type属性直接使用，无需导入
</script>

<style scoped lang="scss">
.app-footer {
  background: var(--color-bg-1);
  border-top: 1px solid var(--color-border-2);
  margin-top: auto;

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    padding: 40px 0;
  }

  .footer-section {
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
      margin-bottom: 20px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 12px;

        a {
          color: var(--el-text-color-regular);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }

    .contact-info {
      p {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        color: var(--el-text-color-regular);

        .el-icon {
          margin-right: 8px;
          color: var(--el-color-primary);
        }
      }
    }
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-top: 1px solid var(--el-border-color-lighter);

    .copyright {
      p {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .links {
      display: flex;
      gap: 20px;

      a {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        text-decoration: none;
        transition: color 0.3s;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .app-footer {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 30px;
      padding: 30px 0;
    }

    .footer-bottom {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
}
</style>