"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Checkbox } from "../ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/api";

const UserPreferencesForm = ({ onSave }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    lifestyle: "moderate",
    livingSpace: "apartment",
    experience: "beginner",
    preferences: {
      petTypes: [],
      sizes: [],
      ages: [],
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFormData(user.profile);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile({ profile: formData });
      updateUser(response.data.user);
      onSave && onSave();
      alert("Cập nhật sở thích thành công!");
    } catch (error) {
      console.error("Error updating preferences:", error);
      alert("Có lỗi xảy ra khi cập nhật sở thích");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (category, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: checked
          ? [...prev.preferences[category], value]
          : prev.preferences[category].filter((item) => item !== value),
      },
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cập nhật sở thích để nhận gợi ý tốt hơn</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lifestyle */}
          <div>
            <Label className="text-base font-medium">Lối sống của bạn</Label>
            <RadioGroup
              value={formData.lifestyle}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, lifestyle: value }))
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">
                  Năng động - Thích vận động, đi dạo thường xuyên
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate">
                  Vừa phải - Cân bằng giữa hoạt động và nghỉ ngơi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quiet" id="quiet" />
                <Label htmlFor="quiet">
                  Yên tĩnh - Thích không gian tĩnh lặng
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Living Space */}
          <div>
            <Label className="text-base font-medium">Không gian sống</Label>
            <RadioGroup
              value={formData.livingSpace}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, livingSpace: value }))
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="apartment" id="apartment" />
                <Label htmlFor="apartment">Chung cư - Không gian hạn chế</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="house" id="house" />
                <Label htmlFor="house">Nhà riêng - Có sân nhỏ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="farm" id="farm" />
                <Label htmlFor="farm">Trang trại - Không gian rộng</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Experience */}
          <div>
            <Label className="text-base font-medium">
              Kinh nghiệm nuôi thú cưng
            </Label>
            <RadioGroup
              value={formData.experience}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, experience: value }))
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">
                  Mới bắt đầu - Chưa có kinh nghiệm
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">
                  Trung bình - Đã nuôi 1-2 con
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expert" id="expert" />
                <Label htmlFor="expert">
                  Có kinh nghiệm - Nuôi nhiều loại thú cưng
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pet Types Preferences */}
          <div>
            <Label className="text-base font-medium">
              Loại thú cưng yêu thích
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {["dog", "cat", "bird", "fish", "rabbit", "hamster"].map(
                (type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.preferences.petTypes.includes(type)}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("petTypes", type, checked)
                      }
                    />
                    <Label htmlFor={type} className="capitalize">
                      {type === "dog"
                        ? "Chó"
                        : type === "cat"
                        ? "Mèo"
                        : type === "bird"
                        ? "Chim"
                        : type === "fish"
                        ? "Cá"
                        : type === "rabbit"
                        ? "Thỏ"
                        : "Chuột hamster"}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Size Preferences */}
          <div>
            <Label className="text-base font-medium">Kích thước ưa thích</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {["small", "medium", "large", "extra_large"].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={size}
                    checked={formData.preferences.sizes.includes(size)}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("sizes", size, checked)
                    }
                  />
                  <Label htmlFor={size}>
                    {size === "small"
                      ? "Nhỏ"
                      : size === "medium"
                      ? "Vừa"
                      : size === "large"
                      ? "Lớn"
                      : "Rất lớn"}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang lưu..." : "Lưu sở thích"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserPreferencesForm;
