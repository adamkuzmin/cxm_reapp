import { Popover, Space, Tooltip } from "antd";
import { useRef, useState } from "react";
import { LeftSide } from "../../../../../pages/scene/topbar";
import useClickedOutside from "../../../../../pages/scene/topbar/outside-hook";
import useLogsStore from "../../../../../store/logs-store";
import { Hotkey, Li } from "../__styles";
import { Line, Message } from "./__styles";

const Logs = () => {
  const [open, setOpen] = useState();
  const ref = useRef();

  useClickedOutside(ref, setOpen);

  const logs = useLogsStore(({ logs }) => logs);

  return (
    <Popover
      className="topbar"
      trigger={[]}
      open={open}
      placement="bottomLeft"
      content={
        <div ref={ref}>
          <Line>
            <Space ref={ref} direction="vertical" size={5}>
              {logs &&
                logs.map(({ content = <></> }, i) => {
                  const last = i === logs.length - 1;

                  return (
                    <Message key={`m:${i}`} last={last}>
                      {content}
                    </Message>
                  );
                })}
            </Space>
          </Line>
        </div>
      }
    >
      <Tooltip title="Логи" open={open ? false : undefined}>
        <LeftSide.Btn
          onClick={(e) => {
            if (!open) {
              e.stopPropagation();
            }

            setOpen((state) => !state);
          }}
          section="note"
        />
      </Tooltip>
    </Popover>
  );
};

export default Logs;
