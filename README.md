### Calculator Test - Floor Panel Properties
----------------------------------------------------------------------------------------------------------------------------------------
<span style="font-size: 18px">
  Based On The Excel. Please Convert the excel become calculator in web.
</span>

#### 1. Please Follow this illustration to build Datatype CLT Layup

<img width="2816" height="1536" alt="clt-layup" src="https://github.com/user-attachments/assets/66c3569f-e169-4bb7-9b03-2a4644d166f6" />

<span style="font-size: 18px">
  On the illustration above we have Layer 1, Layer 2 etc. Each Layer will be covered on datatype CLTLayerType. For combination of layers, we will store on CLTLayupType. So please Build the Data Structure as the illustration above.
</span>

#### 2. Use The Datatype as Parameter to calculate Panel Properties
<span style="font-size: 18px">
  PanelProperties.calculate(CLTLayupType) => Return PanelPropertiesType
</span>

#### 3. Show The Calculation to Front View
<span style="font-size: 18px">
  After Getting the Data Panel Properties and CLT Layup, you can render the data to html in front view of calculator
</span>

#### 4. Detail Information
<span style="font-size: 18px">
  <ul>
    <li>
      Shear Analogy can calculate 3-9 layers. Gamma can calculate 3-5 layers.
    </li>
    <li>
      When Analytical method choose Shear Analogy. Please only show the section of shear analogy and hide the Gamma. When Gamma choose, please hide shear analogy
    </li>
    <li>
      Show the Input Section and Output Render only.
    </li>
    <li>
      Please implement the calculation with Data Structure and Object Oriented Programming
    </li>
    <li>
      The Candidate freely to delete, update, add the code to implement executing this test
    </li>
    <li>
      Tambahkan limitasi untuk shear analogy simetric dari atas ke bawah. Lalu untuk Gamma Hanya bisa 3 dan 5 layer saja.
    </li>
    <li>
      Please fork this branch and make branch <b>assignment-"name"</b> and add https://github.com/NurAfianto and https://github.com/ikhsan017 as contributor
    </li>
  </ul>
</span>
