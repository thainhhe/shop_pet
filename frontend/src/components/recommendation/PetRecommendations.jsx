"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Info, MessageCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const PetRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get("/recommendation/pets");
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getExplanation = async (petId) => {
    try {
      setLoading(true);
      const response = await api.post("/recommendation/explain", { petId });
      setExplanation(response.data.explanation);
      setSelectedPet(petId);
      setShowExplanation(true);
    } catch (error) {
      console.error("Error getting explanation:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreText = (score) => {
    if (score >= 80) return "Rất phù hợp";
    if (score >= 60) return "Phù hợp";
    return "Ít phù hợp";
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user?.profile) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold mb-4">
            Hoàn thành profile để nhận gợi ý
          </h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi cần thông tin về lối sống và sở thích của bạn để đưa ra
            những gợi ý thú cưng phù hợp nhất.
          </p>
          <Button onClick={() => (window.location.href = "/profile")}>
            Cập nhật Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gợi ý thú cưng dành cho bạn</h1>
        <p className="text-gray-600">
          Dựa trên profile và sở thích của bạn, đây là những thú cưng phù hợp
          nhất
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((pet) => (
          <Card
            key={pet._id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={
                  pet.images[0]?.url || "/placeholder.svg?height=200&width=300"
                }
                alt={pet.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge
                  className={`${getScoreColor(pet.matchingScore)} text-white`}
                >
                  {pet.matchingScore}% - {getScoreText(pet.matchingScore)}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 left-2"
                onClick={() => {
                  /* Add to favorites */
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{pet.name}</h3>
                <span className="text-lg font-bold text-green-600">
                  {pet.isForAdoption
                    ? "Nhận nuôi"
                    : `${pet.price.toLocaleString()}đ`}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  {pet.species} • {pet.breed} • {pet.size}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {pet.location.city}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Tại sao phù hợp:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {pet.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-1">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => (window.location.href = `/pets/${pet._id}`)}
                >
                  Xem chi tiết
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => getExplanation(pet._id)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Giải thích từ AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{explanation}</p>
              <Button
                onClick={() => setShowExplanation(false)}
                className="w-full"
              >
                Đóng
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PetRecommendations;
