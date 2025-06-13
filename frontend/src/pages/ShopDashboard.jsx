import React from 'react';

function ShopDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>

            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded shadow">Today Money: $53,000 +5%</div>
                <div className="bg-white p-4 rounded shadow">Today Users: 2,300 +4%</div>
                <div className="bg-white p-4 rounded shadow">New Clients: +3,052 +14%</div>
                <div className="bg-white p-4 rounded shadow">Total Sales: $173,000 +8%</div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded shadow">
                    <p>Built by developers</p>
                    <p className="font-bold">Petconnect UI Dashboard</p>
                    <p>From colors, cards, typography to complex elements, you will find the full documentation.</p>
                    <a href="#" className="text-green-500">Read more +</a>
                </div>
                <div className="bg-green-300 p-4 rounded shadow flex items-center justify-center">
                    <span className="text-4xl">⚡</span>
                    <span className="ml-2 text-white font-bold">chakra</span>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <p>Work with the Rockets</p>
                    <p>It is all about creation who take opportunity first.</p>
                    <a href="#" className="text-green-500">Read more +</a>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Active Users</h3>
                    <p>(+23) last week</p>
                    <div className="grid grid-cols-4 gap-2">
                        <div>Users: 32,984</div>
                        <div>Clicks: 2.42M</div>
                        <div>Sales: 2,400S</div>
                        <div>Items: 320</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Sales overview</h3>
                    <p>(+5) more in 2021</p>
                    <div className="h-40 flex items-end justify-between">
                        <div className="w-4 bg-gray-300" style={{ height: '50%' }}></div>
                        <div className="w-4 bg-gray-300" style={{ height: '70%' }}></div>
                        <div className="w-4 bg-gray-300" style={{ height: '90%' }}></div>
                        <div className="w-4 bg-gray-300" style={{ height: '60%' }}></div>
                        <div className="w-4 bg-gray-300" style={{ height: '80%' }}></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Projects</h3>
                    <p>(+ 30 done this month)</p>
                    <div className="grid grid-cols-3 gap-2">
                        <div>Chakra Soft UI Version</div>
                        <div>$14,000</div>
                        <div>60%</div>
                        <div>Add Progress Track</div>
                        <div>$3,000</div>
                        <div>10%</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Orders overview</h3>
                    <p>(+30% this month)</p>
                    <div>
                        <p>$2400, Design changes</p>
                        <p>23 DEC 7:20 PM</p>
                        <p>New order #4219423</p>
                        <p>21 DEC 11:21 PM</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShopDashboard;