import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-9xl font-black text-slate-200">404</h1>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">Page Not Found</h2>
            <p className="text-slate-500 mt-2 mb-8">The page you're looking for doesn't exist.</p>
            <Link to="/" className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-secondary transition shadow-md">
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;
