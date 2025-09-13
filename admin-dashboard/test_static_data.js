// 测试静态数据加载
import { staticData } from './src/services/staticData/index.ts';

// 检查投票数据是否正确导出
staticData.polls().then(polls => {
  console.log('Polls data loaded:', polls);
  console.log('Number of polls:', polls.length);
  
  // 检查数据结构
  if (polls.length > 0) {
    console.log('First poll:', polls[0]);
  }
}).catch(error => {
  console.error('Error loading polls data:', error);
});