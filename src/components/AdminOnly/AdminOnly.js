import { isAdmin } from '../../utilities/auth';

/**
 * Component that only renders its children if the user is an admin
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Children to render if user is admin
 * @param {React.ReactNode} props.fallback - Optional fallback to render if user is not admin
 */
export const AdminOnly = ({ children, fallback = null }) => {
  return isAdmin() ? children : fallback;
};

export default AdminOnly;
