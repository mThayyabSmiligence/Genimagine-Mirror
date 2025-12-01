import { useNavigate } from "react-router-dom";
import { Code2, Users, ArrowLeft } from "lucide-react";
import "../../Css/ContentType.css"; // Use the CSS for layout and responsiveness

function ContentType() {
  const navigate = useNavigate();
  const contentTypes = [
    {
      id: "technical",
      title: "Technical",
      description: "Programming, software development, and technical skills",
      icon: Code2,
      bgColor: "#22d3ee", // Teal 400
    },
    {
      id: "non-technical",
      title: "Non-Technical",
      description: "Business, soft skills, and general knowledge",
      icon: Users,
      bgColor: "#fb923c", // Orange 400
    },
  ];

  const handleSelect = (type) => {
    navigate(`/u/content-input?type=${type.id}`);
  };

  return (
    <div className="content-type-page mt-5">
        <div className="content-type-inner">
            <button className="back-link" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                <span>Back to Library</span>
            </button>
            <h1 className="content-type-title w-100">Choose Content Type</h1>
            <p className="content-type-desc w-100">
                Select the category that best fits your module
            </p>
            <div className="content-type-cards">
                {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                    <div className="content-card" key={type.id} onClick={() => handleSelect(type)}>
                    <div
                        className="icon-bg"
                        style={{ backgroundColor: type.bgColor }}
                    >
                        <Icon size={32} color="#fff" />
                    </div>
                    <h2 className="content-card-title">{type.title}</h2>
                    <p className="content-card-desc">{type.description}</p>
                    <button
                        className="select-link"
                    >
                        Select <span className="arrow">→</span>
                    </button>
                    </div>
                );
                })}
            </div>
        </div>
    </div>
  );
};

export default ContentType;
