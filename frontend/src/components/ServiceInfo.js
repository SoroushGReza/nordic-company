import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const ServiceInfo = ({ service }) => {
    const renderTooltip = (props) => (
        <Tooltip id={`tooltip-${service.id}`} {...props}>
            <div>
                <strong>Price:</strong> {service.price} EUR <br />
                {service.information && (
                    <>
                        <strong>Information:</strong> <br />
                        <div
                            className="text-start"
                            dangerouslySetInnerHTML={{ __html: service.information.replace(/\n/g, '<br />') }}
                        />
                    </>
                )}
            </div>
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="top"
            overlay={renderTooltip(service)}
        >
            <FontAwesomeIcon
                icon={faInfoCircle}
                className="mx-2"
                style={{ cursor: 'pointer' }}
            />
        </OverlayTrigger>
    );
};

export default ServiceInfo;
