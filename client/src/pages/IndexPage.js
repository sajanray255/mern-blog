import { useEffect, useState } from "react";
import Post from "../Post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/post')
            .then(response => response.json())
            .then(data => {
                setPosts(data);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
            });
    }, []);

    return (
        <>
            {posts.length > 0 ? (
                posts.map(post => (
                    <Post key={post.id} {...post} />
                ))
            ) : (
                <p>No posts available</p>
            )}
        </>
    );
}
