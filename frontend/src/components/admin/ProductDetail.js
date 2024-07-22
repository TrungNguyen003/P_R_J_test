import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../assets/style.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState({
    title: "",
    desc: "",
    price: "",
    image: "",
    galleryImages: [],
  });

  useEffect(() => {
    console.log(`Fetching product with ID: ${id}`);
    axios
      .get(`http://localhost:8081/product/${id}`)
      .then((res) => {
        console.log("Product data:", res.data);
        setProduct(res.data.product);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
      });
  }, [id]);

  return (
    <div>
      <h2>Product Detail</h2>
      <div>
        <h3>{product.title}</h3>
        <p>{product.desc}</p>
        <p>Price: {product.price}</p>
        {product.image && (
          <img
            src={`http://localhost:8081/product_images/${product._id}/${product.image}`}
            alt={''}
            className="product-image"
          />
        )}
      </div>
      <div className="gallery">
        {product.galleryImages.length > 0 && (
          <div>
            <h3>Gallery Images</h3>
            <div className="gallery-images">
              {product.galleryImages.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:8081/product_images/${product._id}/gallery/${image}`}
                  alt= {''}
                  className="gallery-image"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
