<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="数据集名称" prop="datasetName">
        <el-input
          v-model="queryParams.datasetName"
          placeholder="请输入数据集名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数据类型" prop="dataType">
        <el-select v-model="queryParams.dataType" placeholder="请选择数据类型" clearable>
          <el-option
            v-for="dict in dict.type.dataset_data_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据标注类型" prop="notationType">
        <el-select v-model="queryParams.notationType" placeholder="请选择数据标注类型" clearable>
          <el-option
            v-for="dict in dict.type.dataset_notation_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['dataset:dataset:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['dataset:dataset:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['dataset:dataset:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['dataset:dataset:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="datasetList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="数据集ID"  align="center" prop="datasetId" />
      <el-table-column label="数据量"  align="center" prop="remark" />
      <el-table-column label="数据集名称"  align="center" prop="datasetName" />
      <el-table-column label="数据类型"  align="center" prop="dataType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dataset_data_type" :value="scope.row.dataType"/>
        </template>
      </el-table-column>
      <el-table-column label="数据标注类型" align="center" prop="notationType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dataset_notation_type" :value="scope.row.notationType"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleNotation(scope.row)"
          >开始标注</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['dataset:dataset:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改数据集对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="数据集名称" prop="datasetName">
          <el-input v-model="form.datasetName" placeholder="请输入数据集名称" />
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="form.dataType" placeholder="请选择数据类型">
            <el-option
              v-for="dict in dict.type.dataset_data_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据标注类型" prop="notationType">
          <el-select v-model="form.notationType" placeholder="请选择数据标注类型">
            <el-option
              v-for="dict in dict.type.dataset_notation_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDatasetByUserId, listDataset, getDataset, delDataset, addDataset, updateDataset } from "@/api/dataset/dataset";

export default {
  name: "Dataset",
  dicts: ['dataset_data_type', 'dataset_notation_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 数据集表格数据
      datasetList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        'sysUserDataset.userId': 0,
        datasetName: null,
        dataType: null,
        notationType: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        datasetName: [
          { required: true, message: "数据集名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询数据集列表 */
    getList() {
      this.loading = true;
      this.queryParams["sysUserDataset.userId"]=this.$store.getters.id
      // listDatasetByUserId(this.$store.getters.id).then(res => {
      //   this.datasetList = res.rows;
      //   this.total = res.total;
      //   this.loading = false;
      //   console.log(res);
      //   console.log(this.datasetList);
      // })
      console.log("查询", this.queryParams);
      listDataset(this.queryParams).then(response => {
        console.log(response);
        this.datasetList = response.rows;
        this.total = response.total;
        this.loading = false;
        console.log(this.datasetList);
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        sysUserDataset: {
          userId:this.$store.getters.id
        },
        datasetId: null,
        datasetName: null,
        dataType: null,
        notationType: null,
        hasData: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.datasetId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      console.log("handleAdd", this.form);
      this.open = true;
      this.title = "添加数据集";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const datasetId = row.datasetId || this.ids
      console.log(datasetId);
      getDataset(datasetId).then(response => {
        this.form = response.data;
        console.log("getDataset", this.form);
        this.open = true;
        this.title = "修改数据集";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.datasetId != null) {
            console.log("修改数据集", this.form);
            updateDataset(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            console.log("新增数据集", this.form);
            addDataset(this.form).then(response => {
              console.log("新增数据集", this.form);
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const datasetIds = row.datasetId || this.ids;
      let datasetIdsWithUserId = []
      if(Array.isArray(datasetIds)){
        datasetIdsWithUserId = datasetIds.concat(this.$store.getters.id);
      }
      else{
        datasetIdsWithUserId = [datasetIds, this.$store.getters.id]
      }
      console.log(datasetIdsWithUserId);
      this.$modal.confirm('是否确认删除数据集编号为"' + datasetIds + '"的数据项？').then(function() {
        console.log("datasetIds",datasetIdsWithUserId);
        return delDataset(datasetIdsWithUserId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('dataset/dataset/export', {
        ...this.queryParams
      }, `dataset_${new Date().getTime()}.xlsx`)
    },
    /** 去标注 */
    handleNotation(row){
      this.$router.push({path: '/data', query:{
        dataset_id:row.datasetId
        }
      })

    }
  }
};
</script>
