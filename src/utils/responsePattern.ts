const responsePatten = ({
  status,
  message,
  success,
  data,
  errors,
}: {
  status: number;
  success: boolean;
  message: string;
  data?: any;
  errors?: string;
}) => {
  const payload = data ? { data } : { errors };
  return {
    status,
    success,
    message,
    ...payload,
  };
};

export default responsePatten;
