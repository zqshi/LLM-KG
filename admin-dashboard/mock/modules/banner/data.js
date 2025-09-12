/**
 * 横幅管理模块数据
 */

const banners = [
  {
    id: 1,
    title: 'Spring Festival',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPnNwcmluZyBGZXN0aXZhbDwvdGV4dD4KPC9zdmc+',
    linkUrl: 'https://example.com/spring-festival',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    description: '春节活动横幅',
    creator: '管理员',
    createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'Product Launch',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNEVDREMwIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPlByb2R1Y3QgTGF1bmNoPC90ZXh0Pgo8L3N2Zz4=',
    linkUrl: 'https://example.com/product-launch',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    description: '新产品发布横幅',
    creator: '产品经理',
    createTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: 'Training',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNDVCN0QxIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPlRyYWluaW5nPC90ZXh0Pgo8L3N2Zz4=',
    linkUrl: 'https://example.com/training',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    description: '培训活动横幅',
    creator: '人力资源',
    createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: 'Summer Camp',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkZCOTIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPlN1bW1lciBDYW1wPC90ZXh0Pgo8L3N2Zz4=',
    linkUrl: 'https://example.com/summer-camp',
    startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    description: '夏令营活动横幅',
    creator: '活动策划',
    createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    title: 'Tech Conference',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjODUzNEZGIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPlRlY2ggQ29uZmVyZW5jZTwvdGV4dD4KPC9zdmc+',
    linkUrl: 'https://example.com/tech-conference',
    startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    description: '技术大会横幅',
    creator: '技术部',
    createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

module.exports = {
  banners
};