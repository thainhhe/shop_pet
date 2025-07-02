"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import PetRecommendations from "../components/recommendation/PetRecommendations";
import UserPreferencesForm from "../components/profile/UserPreferencesForm";
import RecommendationChatbot from "../components/chatbot/RecommendationChatbot";

const RecommendationPage = () => {
  const [activeTab, setActiveTab] = useState("recommendations");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="inline-block text-blue-500 mr-2">✨</span>
            Pet Recommendation System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tìm thú cưng hoàn hảo dành cho bạn với sự hỗ trợ của AI thông minh
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {({ activeTab, setActiveTab }) => (
            <>
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger
                    value="recommendations"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    className="flex items-center gap-2"
                  >
                    <span>❤️</span>
                    Gợi ý
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    className="flex items-center gap-2"
                  >
                    <span>⚙️</span>
                    Sở thích
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    className="flex items-center gap-2"
                  >
                    <span>✨</span>
                    Thống kê
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="recommendations" activeTab={activeTab}>
                <PetRecommendations />
              </TabsContent>

              <TabsContent value="preferences" activeTab={activeTab}>
                <UserPreferencesForm
                  onSave={() => setActiveTab("recommendations")}
                />
              </TabsContent>

              <TabsContent value="stats" activeTab={activeTab}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">
                        Độ chính xác AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-3xl font-bold text-green-500">
                        94%
                      </div>
                      <p className="text-sm text-gray-600">
                        Người dùng hài lòng
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">
                        Thú cưng được gợi ý
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-3xl font-bold text-blue-500">
                        1,247
                      </div>
                      <p className="text-sm text-gray-600">Trong tháng này</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">
                        Nhận nuôi thành công
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-3xl font-bold text-purple-500">
                        89%
                      </div>
                      <p className="text-sm text-gray-600">Tỷ lệ thành công</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <RecommendationChatbot />
    </div>
  );
};

export default RecommendationPage;
