import AuthCard from '../components/AuthCard';

const Login = () => {
  return (
    <div className="cb-auth-page">
      <AuthCard initialMode="login" isModal={false} />
    </div>
  );
};

export default Login;
