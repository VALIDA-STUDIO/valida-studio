"use client";

import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styles from "./editor.module.css";

const fitViewOptions = { maxZoom: 1 };

// Empty node canvas: dotted background and zoom controls, nothing else yet.
export default function Canvas() {
  return (
    <div className={styles.wrap}>
      <ReactFlowProvider>
        <ReactFlow className={styles.flow} nodes={[]} edges={[]} fitViewOptions={fitViewOptions} minZoom={0.4} maxZoom={1.75} proOptions={{ hideAttribution: true }}>
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
