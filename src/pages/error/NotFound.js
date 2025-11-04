import React from 'react';
import { Link } from "react-router-dom";
import Layout from '../../layout/fullpage';

import {Image} from '../../components';

function NotFound() {
  return (
    <Layout title="NotFound" mask="2" centered>
        <div className="container">
            <div className="nk-block">
                <div className="nk-block-content wide-sm text-center mx-auto">
                    <Image src="/images/error/a.svg" alt="error image" className="mb-4"/>
                    <h2 className="nk-error-title mb-2">OOPS! Page not found!</h2>
                    <p className="nk-error-text">We are very sorry for inconvenience. It looks like you’re try to access a page that either has been deleted or never existed.</p>
                    <Link to="/" className="btn btn-primary mt-1">
                        <em className="icon ni ni-arrow-left"></em>
                        <span>Back To Home</span>
                    </Link>
                </div>
            </div>
        </div>
    </Layout>
  )
}

export default NotFound;
