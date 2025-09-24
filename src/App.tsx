import { useState, useEffect } from "react";
import "./App.css";
import { createPresignedUrl } from "./components/createPresignedUrl";
import { listAllObjectKeys } from "./components/listAllObjectKeys";

// 이미지 가져오기
const bucket: string = import.meta.env.VITE_AWS_S3_IMAGE_BUCKET;

function App() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        // 1. 모든 객체 키 가져오기
        const keys = await listAllObjectKeys(bucket);

        // 2. 각 키에 대한 미리 서명된 URL 생성
        const urls = await createPresignedUrl({
          bucketName: bucket,
          objectKeys: keys,
        });

        if (urls) {
          setImageUrls(urls);
        } else {
          setError("Failed to fetch image URLs.");
        }
      } catch (e) {
        console.error("Error fetching images:", e);
        setError("Failed to load images.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행되도록 합니다.

  if (loading) {
    return <div>Loading images...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // 테스트 코드
  // listAllObjectKeys(bucket).then((keys) => {
  //   console.log("All object keys:", keys);
  // });

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
