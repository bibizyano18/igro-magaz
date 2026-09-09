type FeatureCardProps = {
    title: string;
    description: string;
};

export const FeatureCard = ({ title, description }: FeatureCardProps) => {
    return (
        <div className="feature-card">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    )
}