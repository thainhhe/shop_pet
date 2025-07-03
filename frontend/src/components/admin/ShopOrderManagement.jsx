import React from "react";
import { OrderManagementBase } from "./OrderManagement";
import api from "../../services/api";

// Shop-specific API wrappers
const shopAPI = {
    getOrders: (params) => api.get("/shop/orders", { params }),
    updateOrderStatus: (id, status) => api.put(`/shop/orders/${id}/status`, { status }),
};

// Các status, icons, colors, workflow giống admin
import {
    statusLabels,
    statusIcons,
    statusColors,
    statusWorkflow,
} from "./OrderManagement";

const ShopOrderManagement = () => {
    return (
        <OrderManagementBase
            fetchOrdersApi={shopAPI.getOrders}
            updateOrderStatusApi={shopAPI.updateOrderStatus}
            canUpdateStatus={true}
            title="Quản lý đơn hàng của shop"
            searchUserPlaceholder="Tìm theo Mã đơn"
            searchNamePlaceholder="Tìm theo tên khách hàng"
            statusLabelsOverride={statusLabels}
            statusIconsOverride={statusIcons}
            statusColorsOverride={statusColors}
            statusWorkflowOverride={statusWorkflow}
        />
    );
};

export default ShopOrderManagement; 