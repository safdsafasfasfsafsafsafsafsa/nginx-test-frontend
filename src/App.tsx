import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null); // 새로운 fetch 시작 시 에러 초기화

        // 백엔드 API 서버의 '/images' 엔드포인트 호출
        // const response = await fetch("http://[EC2 퍼블릭 IP]:80/images");
        const response = await fetch("https://ngxt.p-e.kr/images");

        if (!response.ok) {
          throw new Error("Failed to fetch images from backend.");
        }

        const urls: string[] = await response.json();

        // 이미지 목록이 비어있는 경우, 에러가 아닌 정상 상태로 처리
        setImageUrls(urls);
      } catch (e) {
        console.error("Error fetching images:", e);
        if (e instanceof Error) {
          setError(`Failed to load images: ${e.message}`);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return <div>Loading images...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>S3 Image</h2>
      <ul>
        {imageUrls.length > 0 ? (
          imageUrls.map((url, index) => (
            <li key={index}>
              <img
                src={url}
                alt={`Image ${index}`}
                style={{ maxWidth: "300px" }}
              />
            </li>
          ))
        ) : (
          <div>No images found.</div>
        )}
      </ul>
    </div>
  );
}

export default App;
