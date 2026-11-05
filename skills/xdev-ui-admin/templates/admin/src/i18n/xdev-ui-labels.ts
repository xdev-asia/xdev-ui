// Labels for the library parts this app uses. The parts ship English defaults; pass these as `labels`.
export const uiLabels = {
  en: {
    appShell: { openNav: "Open navigation", closeNav: "Close navigation", skipToContent: "Skip to content", nav: "Navigation" },
    toast: { dismiss: "Dismiss" },
    themeSwitch: { group: "Theme", system: "System", dark: "Dark", light: "Light" },
    dataTable: { selectAll: "Select all rows", selectRow: (name: string) => `Select ${name}`, sortedAsc: "sorted ascending", sortedDesc: "sorted descending", loading: "Loading" },
    pagination: { nav: "Pagination", previous: "Previous page", next: "Next page", range: (from: number, to: number, total: number) => `${from}–${to} of ${total}`, pageSize: "Rows per page" },
    statTile: { loading: "Loading" },
    spinner: { loading: "Loading" },
    searchInput: { search: "Search", clear: "Clear search", count: (n: number) => `${n} results` },
    breadcrumb: { breadcrumb: "Breadcrumb" },
    navList: { nav: "Sections" },
  },
  vi: {
    appShell: { openNav: "Mở điều hướng", closeNav: "Đóng điều hướng", skipToContent: "Chuyển đến nội dung", nav: "Điều hướng" },
    toast: { dismiss: "Đóng" },
    themeSwitch: { group: "Chủ đề", system: "Hệ thống", dark: "Tối", light: "Sáng" },
    dataTable: { selectAll: "Chọn tất cả các dòng", selectRow: (name: string) => `Chọn ${name}`, sortedAsc: "sắp xếp tăng dần", sortedDesc: "sắp xếp giảm dần", loading: "Đang tải" },
    pagination: { nav: "Phân trang", previous: "Trang trước", next: "Trang sau", range: (from: number, to: number, total: number) => `${from}–${to} trên ${total}`, pageSize: "Số dòng mỗi trang" },
    statTile: { loading: "Đang tải" },
    spinner: { loading: "Đang tải" },
    searchInput: { search: "Tìm kiếm", clear: "Xóa nội dung tìm", count: (n: number) => `${n} kết quả` },
    breadcrumb: { breadcrumb: "Đường dẫn" },
    navList: { nav: "Mục" },
  },
};
