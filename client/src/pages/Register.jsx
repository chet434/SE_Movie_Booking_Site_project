import AuthCard from '../components/AuthCard';

const Register = () => {
  return (
    <div className="cb-auth-page">
      <AuthCard initialMode="register" isModal={false} />
    </div>
  );
};

export default Register;
