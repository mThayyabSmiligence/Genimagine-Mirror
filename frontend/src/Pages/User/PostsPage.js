import React from "react";
import { Link } from "react-router-dom";
import "../../Css/PostsPage.css";
import { DecimalsArrowRightIcon } from "lucide-react";

function PostsPage() {
  const posts = [
    {
      id: 1,
      for: "published images",
      description:
        "View and manage your published images in the explore gallery",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      ),
      route: "/u/published-images",
    },
    {
      id: 2,
      for: "published videos",
      description:
        "View and manage your published videos in the explore gallery",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      ),
      route: "/u/published-videos",
    },
  ];

  return (
    <div className="post-container mt-5">
      <div className="post-header-section">
        <div className="post-heading p-3 d-flex align-items-center flex-column jsutify-content-center">
          <h3 className="mb-2">MY POSTS</h3>
          <p className="m-0 posts-subtitle">
            Manage your published content across the platform
          </p>
        </div>
      </div>

      <div className="post-card-container">
        {posts.map((post) => (
          <Link key={[post].id} to={post.route} className="post-card">
            <div className="post-card-icon-wrapper">
              <div className="post-card-icon">{post.icon}</div>
            </div>

            {/* Content */}
            <div className="post-card-content">
              <h3 className="post-card-title">{post.title}</h3>
              <p className="post-card-description">{post.description}</p>
            </div>

            {/* Arrow Icon */}
            <div className="post-card-arrow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PostsPage;






// import React from "react";
// import { Link } from "react-router-dom";
// import "../../Css/PostsPage.css";

// function PostsPage() {
//   const postTypes = [
//     {
//       id: 1,
//       title: "Published Images",
//       description: "View and manage your published images in the explore gallery",
//       icon: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="48"
//           height="48"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
//           <circle cx="8.5" cy="8.5" r="1.5"></circle>
//           <polyline points="21 15 16 10 5 21"></polyline>
//         </svg>
//       ),
//       route: "/u/published-images",
//       color: "#6366f1",
//       bgColor: "rgba(99, 102, 241, 0.1)",
//     },
//     {
//       id: 2,
//       title: "Published Videos",
//       description: "View and manage your published videos in the explore gallery",
//       icon: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="48"
//           height="48"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <polygon points="23 7 16 12 23 17 23 7"></polygon>
//           <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
//         </svg>
//       ),
//       route: "/u/published-videos",
//       color: "#ec4899",
//       bgColor: "rgba(236, 72, 153, 0.1)",
//     },
//   ];

//   return (
//     <div className="mt-5 posts-page-container">
//       {/* Header Section */}
//       <div className="posts-header-section">
//         <div className="posts-heading">
//           <h1>My Posts</h1>
//           <p className="posts-subtitle">
//             Manage your published content across the platform
//           </p>
//         </div>
//       </div>

//       {/* Cards Grid */}
//       <div className="posts-cards-container">
//         {postTypes.map((post) => (
//           <Link
//             key={post.id}
//             to={post.route}
//             className="post-type-card"
//             style={{ "--card-color": post.color, "--card-bg": post.bgColor }}
//           >
//             {/* Icon Container */}
//             <div className="post-card-icon-wrapper">
//               <div className="post-card-icon">{post.icon}</div>
//             </div>

//             {/* Content */}
//             <div className="post-card-content">
//               <h3 className="post-card-title">{post.title}</h3>
//               <p className="post-card-description">{post.description}</p>
//             </div>

//             {/* Arrow Icon */}
//             <div className="post-card-arrow">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <line x1="5" y1="12" x2="19" y2="12"></line>
//                 <polyline points="12 5 19 12 12 19"></polyline>
//               </svg>
//             </div>

//             {/* Hover Effect Background */}
//             <div className="post-card-hover-bg"></div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default PostsPage;
