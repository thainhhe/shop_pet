import React from 'react';
import { Card, Select, DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;

const DateFilter = ({
    dateFilterType,
    selectedMonth,
    dateRange,
    onDateFilterChange
}) => {
    return (
        <Card size="small" className="shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <CalendarOutlined className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Lọc theo thời gian:</span>
                </div>

                <Select
                    value={dateFilterType}
                    onChange={(value) => onDateFilterChange(value, null)}
                    style={{ width: 120 }}
                >
                    <Option value="month">Theo tháng</Option>
                    <Option value="range">Khoảng thời gian</Option>
                </Select>

                {dateFilterType === 'month' ? (
                    <MonthPicker
                        value={selectedMonth}
                        onChange={(value) => onDateFilterChange('month', value)}
                        placeholder="Chọn tháng"
                        format="MM/YYYY"
                        style={{ width: 150 }}
                    />
                ) : (
                    <RangePicker
                        value={dateRange}
                        onChange={(value) => onDateFilterChange('range', value)}
                        placeholder={['Từ ngày', 'Đến ngày']}
                        format="DD/MM/YYYY"
                        style={{ width: 250 }}
                    />
                )}
            </div>
        </Card>
    );
};

export default DateFilter; 